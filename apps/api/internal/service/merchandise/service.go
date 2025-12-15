package merchandise

import (
	"errors"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/merchandise"
	merchandiserepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/merchandise"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
)

var (
	ErrMerchandiseNotFound = errors.New("merchandise not found")
)

type Service struct {
	repo merchandiserepo.Repository
}

func NewService(repo merchandiserepo.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetByID returns a merchandise by ID
func (s *Service) GetByID(id string) (*merchandise.MerchandiseResponse, error) {
	m, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMerchandiseNotFound
		}
		return nil, err
	}
	return m.ToMerchandiseResponse(), nil
}

// Create creates a new merchandise
func (s *Service) Create(req *merchandise.CreateMerchandiseRequest) (*merchandise.MerchandiseResponse, error) {
	m := &merchandise.Merchandise{
		EventID:     req.EventID,
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		Variant:     req.Variant,
		ImageURL:    req.ImageURL,
		IconName:    req.IconName,
		Status:      "active",
	}

	if err := s.repo.Create(m); err != nil {
		return nil, err
	}

	// Reload to get generated fields
	createdMerchandise, err := s.repo.FindByID(m.ID)
	if err != nil {
		return nil, err
	}

	return createdMerchandise.ToMerchandiseResponse(), nil
}

// Update updates a merchandise
func (s *Service) Update(id string, req *merchandise.UpdateMerchandiseRequest) (*merchandise.MerchandiseResponse, error) {
	// Find merchandise
	m, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMerchandiseNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Name != nil {
		m.Name = *req.Name
	}
	if req.Description != nil {
		m.Description = *req.Description
	}
	if req.Price != nil {
		m.Price = *req.Price
	}
	if req.Stock != nil {
		m.Stock = *req.Stock
	}
	if req.Variant != nil {
		m.Variant = *req.Variant
	}
	if req.ImageURL != nil {
		m.ImageURL = *req.ImageURL
	}
	if req.IconName != nil {
		m.IconName = *req.IconName
	}
	if req.Status != nil {
		m.Status = *req.Status
	}

	if err := s.repo.Update(m); err != nil {
		return nil, err
	}

	// Reload
	updatedMerchandise, err := s.repo.FindByID(m.ID)
	if err != nil {
		return nil, err
	}

	return updatedMerchandise.ToMerchandiseResponse(), nil
}

// Delete deletes a merchandise
func (s *Service) Delete(id string) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrMerchandiseNotFound
		}
		return err
	}

	return s.repo.Delete(id)
}

// List lists all merchandises with pagination and filters
func (s *Service) List(req *merchandise.ListMerchandiseRequest) ([]*merchandise.MerchandiseResponse, *response.PaginationMeta, error) {
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
	if req.EventID != "" {
		filters["event_id"] = req.EventID
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.Search != "" {
		filters["search"] = req.Search
	}

	merchandises, total, err := s.repo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*merchandise.MerchandiseResponse, len(merchandises))
	for i, m := range merchandises {
		responses[i] = m.ToMerchandiseResponse()
	}

	pagination := response.NewPaginationMeta(page, perPage, int(total))

	return responses, pagination, nil
}

// GetInventory gets merchandise inventory summary
func (s *Service) GetInventory(eventID string) (*merchandise.InventoryResponse, error) {
	filters := make(map[string]interface{})
	if eventID != "" {
		filters["event_id"] = eventID
	}

	merchandises, _, err := s.repo.List(1, 1000, filters) // Get all for inventory
	if err != nil {
		return nil, err
	}

	totalProducts := len(merchandises)
	totalStock := 0
	lowStockCount := 0
	outOfStockCount := 0

	products := make([]*merchandise.MerchandiseResponse, 0, len(merchandises))
	for _, m := range merchandises {
		totalStock += m.Stock
		if m.Stock <= 0 {
			outOfStockCount++
		} else if m.Stock < 20 {
			lowStockCount++
		}
		products = append(products, m.ToMerchandiseResponse())
	}

	return &merchandise.InventoryResponse{
		TotalProducts:  totalProducts,
		TotalStock:     totalStock,
		LowStockCount:  lowStockCount,
		OutOfStockCount: outOfStockCount,
		Products:       products,
	}, nil
}
