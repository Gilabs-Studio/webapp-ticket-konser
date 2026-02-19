package checkin

import (
	"errors"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
	orderitem "github.com/gilabs/webapp-ticket-konser/api/internal/domain/order_item"
	checkinrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/checkin"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
)

var (
	ErrCheckInNotFound      = errors.New("check-in not found")
	ErrInvalidQRCode        = errors.New("invalid QR code")
	ErrQRCodeAlreadyUsed    = errors.New("QR code already used")
	ErrTicketNotPaid        = errors.New("ticket is not paid")
	ErrTicketAlreadyCheckedIn = errors.New("ticket already checked in")
)

type Service struct {
	checkInRepo   checkinrepo.Repository
	orderItemRepo orderitemrepo.Repository
}

func NewService(checkInRepo checkinrepo.Repository, orderItemRepo orderitemrepo.Repository) *Service {
	return &Service{
		checkInRepo:   checkInRepo,
		orderItemRepo: orderItemRepo,
	}
}

// ValidateQRCode validates a QR code and returns validation result
func (s *Service) ValidateQRCode(qrCode string) (*checkin.ValidateQRCodeResponse, error) {
	// Find order item by QR code
	orderItem, err := s.orderItemRepo.FindByQRCode(qrCode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &checkin.ValidateQRCodeResponse{
				Valid:   false,
				Message: "QR code tidak valid",
			}, nil
		}
		return nil, err
	}

	// Check if ticket is paid
	if orderItem.Status != orderitem.TicketStatusPaid {
		return &checkin.ValidateQRCodeResponse{
			Valid:   false,
			Status:  string(orderItem.Status),
			Message: "Tiket belum dibayar",
		}, nil
	}

	// Check if already checked in (one-scan validation)
	checkInCount, err := s.checkInRepo.CountByOrderItemID(orderItem.ID)
	if err != nil {
		return nil, err
	}

	if checkInCount > 0 {
		return &checkin.ValidateQRCodeResponse{
			Valid:       false,
			OrderItemID: orderItem.ID,
			Status:      string(orderItem.Status),
			Message:     "QR code sudah pernah digunakan",
			AlreadyUsed: true,
		}, nil
	}

	return &checkin.ValidateQRCodeResponse{
		Valid:       true,
		OrderItemID: orderItem.ID,
		Status:      string(orderItem.Status),
		Message:     "QR code valid",
		AlreadyUsed: false,
	}, nil
}

// CheckIn performs check-in operation
func (s *Service) CheckIn(req *checkin.CheckInRequest, staffID, ipAddress, userAgent string) (*checkin.CheckInResultResponse, error) {
	// Validate QR code first
	validation, err := s.ValidateQRCode(req.QRCode)
	if err != nil {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Terjadi kesalahan saat validasi QR code",
			ErrorCode: "VALIDATION_ERROR",
		}, err
	}

	if !validation.Valid {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   validation.Message,
			ErrorCode: "INVALID_QR_CODE",
		}, nil
	}

	if validation.AlreadyUsed {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "QR code sudah pernah digunakan",
			ErrorCode: "QR_CODE_ALREADY_USED",
		}, nil
	}

	// Find order item
	orderItem, err := s.orderItemRepo.FindByQRCode(req.QRCode)
	if err != nil {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Order item tidak ditemukan",
			ErrorCode: "ORDER_ITEM_NOT_FOUND",
		}, err
	}

	// Check if already checked in (duplicate detection)
	existingCheckIns, err := s.checkInRepo.FindByOrderItemID(orderItem.ID)
	if err != nil {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Terjadi kesalahan saat cek duplicate",
			ErrorCode: "DUPLICATE_CHECK_ERROR",
		}, err
	}

	if len(existingCheckIns) > 0 {
		// Duplicate detected - return existing check-in
		return &checkin.CheckInResultResponse{
			Success: false,
			CheckIn: existingCheckIns[0].ToCheckInResponse(),
			Message: "QR code sudah pernah digunakan (duplicate detected)",
			ErrorCode: "DUPLICATE_CHECK_IN",
		}, nil
	}

	// Check if ticket is paid
	if orderItem.Status != orderitem.TicketStatusPaid {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Tiket belum dibayar",
			ErrorCode: "TICKET_NOT_PAID",
		}, nil
	}

	// Create check-in record
	now := time.Now()
	checkIn := &checkin.CheckIn{
		OrderItemID: orderItem.ID,
		QRCode:      req.QRCode,
		GateID:      req.GateID,
		StaffID:     staffID,
		Status:      checkin.CheckInStatusSuccess,
		Location:    req.Location,
		IPAddress:   ipAddress,
		UserAgent:   userAgent,
		CheckedInAt: now,
	}

	if err := s.checkInRepo.Create(checkIn); err != nil {
		if isPostgresUniqueViolation(err) {
			// Another concurrent request inserted the check-in first.
			existingCheckIns, fetchErr := s.checkInRepo.FindByOrderItemID(orderItem.ID)
			if fetchErr == nil && len(existingCheckIns) > 0 {
				return &checkin.CheckInResultResponse{
					Success:   false,
					CheckIn:   existingCheckIns[0].ToCheckInResponse(),
					Message:   "QR code sudah pernah digunakan (duplicate detected)",
					ErrorCode: "DUPLICATE_CHECK_IN",
				}, nil
			}

			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "QR code sudah pernah digunakan",
				ErrorCode: "DUPLICATE_CHECK_IN",
			}, nil
		}

		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Gagal menyimpan check-in",
			ErrorCode: "CREATE_CHECK_IN_ERROR",
		}, err
	}

	// Update order item status to CHECKED-IN
	orderItem.Status = orderitem.TicketStatusCheckedIn
	orderItem.CheckInTime = &now
	if err := s.orderItemRepo.Update(orderItem); err != nil {
		// Log error but don't fail the check-in
		// The check-in record is already created
		// TODO: Add logging here
	}

	// Reload check-in with relations
	createdCheckIn, err := s.checkInRepo.FindByID(checkIn.ID)
	if err != nil {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Check-in berhasil tapi gagal reload data",
			ErrorCode: "RELOAD_ERROR",
		}, err
	}

	return &checkin.CheckInResultResponse{
		Success: true,
		CheckIn:  createdCheckIn.ToCheckInResponse(),
		Message: "Check-in berhasil",
	}, nil
}

func isPostgresUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}

// GetByID returns a check-in by ID
func (s *Service) GetByID(id string) (*checkin.CheckInResponse, error) {
	c, err := s.checkInRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCheckInNotFound
		}
		return nil, err
	}
	return c.ToCheckInResponse(), nil
}

// List lists check-ins with pagination and filters
func (s *Service) List(req *checkin.ListCheckInsRequest) ([]*checkin.CheckInResponse, *response.PaginationMeta, error) {
	page := 1
	perPage := 20

	if req.Page > 0 {
		page = req.Page
	}
	if req.PerPage > 0 && req.PerPage <= 100 {
		perPage = req.PerPage
	}

	// Build filters
	filters := make(map[string]interface{})
	if req.OrderItemID != "" {
		filters["order_item_id"] = req.OrderItemID
	}
	if req.GateID != "" {
		filters["gate_id"] = req.GateID
	}
	if req.StaffID != "" {
		filters["staff_id"] = req.StaffID
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.StartDate != nil {
		filters["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		filters["end_date"] = req.EndDate
	}

	checkIns, total, err := s.checkInRepo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*checkin.CheckInResponse, len(checkIns))
	for i, c := range checkIns {
		responses[i] = c.ToCheckInResponse()
	}

	pagination := response.NewPaginationMeta(page, perPage, int(total))

	return responses, pagination, nil
}

// GetByQRCode returns check-ins by QR code
func (s *Service) GetByQRCode(qrCode string) ([]*checkin.CheckInResponse, error) {
	checkIns, err := s.checkInRepo.FindByQRCode(qrCode)
	if err != nil {
		return nil, err
	}

	responses := make([]*checkin.CheckInResponse, len(checkIns))
	for i, c := range checkIns {
		responses[i] = c.ToCheckInResponse()
	}

	return responses, nil
}

// GetByOrderItemID returns check-ins by order item ID
func (s *Service) GetByOrderItemID(orderItemID string) ([]*checkin.CheckInResponse, error) {
	checkIns, err := s.checkInRepo.FindByOrderItemID(orderItemID)
	if err != nil {
		return nil, err
	}

	responses := make([]*checkin.CheckInResponse, len(checkIns))
	for i, c := range checkIns {
		responses[i] = c.ToCheckInResponse()
	}

	return responses, nil
}

// GetByGateID returns check-ins by gate ID
func (s *Service) GetByGateID(gateID string) ([]*checkin.CheckInResponse, error) {
	checkIns, err := s.checkInRepo.FindByGateID(gateID)
	if err != nil {
		return nil, err
	}

	responses := make([]*checkin.CheckInResponse, len(checkIns))
	for i, c := range checkIns {
		responses[i] = c.ToCheckInResponse()
	}

	return responses, nil
}

