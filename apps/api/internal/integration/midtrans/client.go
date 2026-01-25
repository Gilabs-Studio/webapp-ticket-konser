package midtrans

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/config"
)

// Client represents Midtrans API client
type Client struct {
	ServerKey  string
	ClientKey  string
	MerchantID string
	APIBaseURL string
	HTTPClient *http.Client
}

// NewClient creates a new Midtrans client
func NewClient() *Client {
	cfg := config.AppConfig.Midtrans
	return &Client{
		ServerKey:  cfg.ServerKey,
		ClientKey:  cfg.ClientKey,
		MerchantID: cfg.MerchantID,
		APIBaseURL: cfg.APIBaseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// CreateTransactionRequest represents Midtrans transaction request
type CreateTransactionRequest struct {
	TransactionDetails TransactionDetails `json:"transaction_details"`
	ItemDetails        []ItemDetail       `json:"item_details"`
	CustomerDetails    CustomerDetails    `json:"customer_details"`
	PaymentType        string             `json:"payment_type"`
	QRIS               *QRISConfig        `json:"qris,omitempty"`
	Expiry             *ExpiryConfig      `json:"expiry,omitempty"`
}

// TransactionDetails represents transaction details
type TransactionDetails struct {
	OrderID     string  `json:"order_id"`
	GrossAmount float64 `json:"gross_amount"`
}

// ItemDetail represents item detail
type ItemDetail struct {
	ID       string  `json:"id"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
	Name     string  `json:"name"`
}

// CustomerDetails represents customer details
type CustomerDetails struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name,omitempty"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
}

// QRISConfig represents QRIS configuration
type QRISConfig struct {
	Acquirer string `json:"acquirer,omitempty"` // "gopay", "shopeepay", "dana", etc.
}

// ExpiryConfig represents expiry configuration
type ExpiryConfig struct {
	StartTime string `json:"start_time"` // ISO 8601 format
	Unit      string `json:"unit"`       // "minute", "hour", "day"
	Duration  int    `json:"duration"`
}

// CreateTransactionResponse represents Midtrans transaction response
type CreateTransactionResponse struct {
	StatusCode        string   `json:"status_code"`
	StatusMessage     string   `json:"status_message"`
	TransactionID     string   `json:"transaction_id"`
	OrderID           string   `json:"order_id"`
	GrossAmount       string   `json:"gross_amount"`
	PaymentType       string   `json:"payment_type"`
	TransactionTime   string   `json:"transaction_time"`
	TransactionStatus string   `json:"transaction_status"`
	QRISCode          string   `json:"qr_string,omitempty"` // QRIS code
	Actions           []Action `json:"actions,omitempty"`
	ExpiryTime        string   `json:"expiry_time,omitempty"`
}

// Action represents payment action (for redirect URLs, etc.)
type Action struct {
	Name   string `json:"name"`
	Method string `json:"method"`
	URL    string `json:"url"`
}

// TransactionStatusResponse represents transaction status response
type TransactionStatusResponse struct {
	StatusCode        string   `json:"status_code"`
	StatusMessage     string   `json:"status_message"`
	TransactionID     string   `json:"transaction_id"`
	OrderID           string   `json:"order_id"`
	GrossAmount       string   `json:"gross_amount"`
	PaymentType       string   `json:"payment_type"`
	TransactionTime   string   `json:"transaction_time"`
	TransactionStatus string   `json:"transaction_status"`
	SettlementTime    string   `json:"settlement_time,omitempty"`
	QRISCode          string   `json:"qr_string,omitempty"` // QRIS code (available for pending QRIS transactions)
	Actions           []Action `json:"actions,omitempty"`
	ExpiryTime        string   `json:"expiry_time,omitempty"`
}

// WebhookPayload represents Midtrans webhook payload
type WebhookPayload struct {
	TransactionTime   string `json:"transaction_time"`
	TransactionStatus string `json:"transaction_status"`
	TransactionID     string `json:"transaction_id"`
	StatusMessage     string `json:"status_message"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
	PaymentType       string `json:"payment_type"`
	OrderID           string `json:"order_id"`
	MerchantID        string `json:"merchant_id"`
	GrossAmount       string `json:"gross_amount"`
	FraudStatus       string `json:"fraud_status"`
	Currency          string `json:"currency"`
}

// CreateTransaction creates a new Midtrans transaction
func (c *Client) CreateTransaction(req *CreateTransactionRequest) (*CreateTransactionResponse, error) {
	return c.CreateTransactionWithContext(context.Background(), req)
}

func (c *Client) CreateTransactionWithContext(ctx context.Context, req *CreateTransactionRequest) (*CreateTransactionResponse, error) {
	url := fmt.Sprintf("%s/v2/charge", c.APIBaseURL)

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Basic "+c.getBasicAuth())

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errorResp struct {
			StatusCode    string `json:"status_code"`
			StatusMessage string `json:"status_message"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return nil, fmt.Errorf("midtrans error: %s - %s", errorResp.StatusCode, errorResp.StatusMessage)
		}
		return nil, fmt.Errorf("midtrans error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var transactionResp CreateTransactionResponse
	if err := json.Unmarshal(body, &transactionResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &transactionResp, nil
}

// GetTransactionStatus gets transaction status from Midtrans
func (c *Client) GetTransactionStatus(transactionID string) (*TransactionStatusResponse, error) {
	return c.GetTransactionStatusWithContext(context.Background(), transactionID)
}

func (c *Client) GetTransactionStatusWithContext(ctx context.Context, transactionID string) (*TransactionStatusResponse, error) {
	url := fmt.Sprintf("%s/v2/%s/status", c.APIBaseURL, transactionID)

	httpReq, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Basic "+c.getBasicAuth())

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			StatusCode    string `json:"status_code"`
			StatusMessage string `json:"status_message"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return nil, fmt.Errorf("midtrans error: %s - %s", errorResp.StatusCode, errorResp.StatusMessage)
		}
		return nil, fmt.Errorf("midtrans error: status %d, body: %s", resp.StatusCode, string(body))
	}

	var statusResp TransactionStatusResponse
	if err := json.Unmarshal(body, &statusResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &statusResp, nil
}

// VerifyWebhookSignature verifies webhook signature from Midtrans
// Signature is computed as: SHA512(order_id + status_code + gross_amount + server_key)
func (c *Client) VerifyWebhookSignature(payload *WebhookPayload) bool {
	// Concatenate: order_id + status_code + gross_amount + server_key
	signatureString := payload.OrderID + payload.StatusCode + payload.GrossAmount + c.ServerKey

	// Compute SHA512 hash
	hash := sha512.Sum512([]byte(signatureString))
	expectedSignature := hex.EncodeToString(hash[:])

	// Compare with signature_key from payload (case-insensitive)
	return strings.EqualFold(expectedSignature, payload.SignatureKey)
}

// getBasicAuth returns Basic Auth header value
func (c *Client) getBasicAuth() string {
	auth := c.ServerKey + ":"
	return base64.StdEncoding.EncodeToString([]byte(auth))
}
