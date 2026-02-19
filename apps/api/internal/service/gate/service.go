package gate

import (
	"errors"
	"strings"
	"time"

	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/checkin"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/gate"
	"github.com/gilabs/webapp-ticket-konser/api/internal/domain/user"
	checkinrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/checkin"
	gaterepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/gate"
	gatestaffrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/gate_staff"
	orderitemrepo "github.com/gilabs/webapp-ticket-konser/api/internal/repository/interfaces/order_item"
	checkinservice "github.com/gilabs/webapp-ticket-konser/api/internal/service/checkin"
	"github.com/gilabs/webapp-ticket-konser/api/pkg/response"
	"gorm.io/gorm"
)

var (
	ErrGateNotFound         = errors.New("gate not found")
	ErrGateCodeExists       = errors.New("gate code already exists")
	ErrGateInactive         = errors.New("gate is inactive")
	ErrInvalidGate          = errors.New("invalid gate")
	ErrGateCapacityExceeded = errors.New("gate capacity exceeded")
	ErrVIPGateRequired      = errors.New("VIP gate required for this ticket")
)

type Service struct {
	gateRepo       gaterepo.Repository
	gateStaffRepo  gatestaffrepo.Repository
	orderItemRepo  orderitemrepo.Repository
	checkInRepo    checkinrepo.Repository
	checkInService *checkinservice.Service
}

func NewService(
	gateRepo gaterepo.Repository,
	gateStaffRepo gatestaffrepo.Repository,
	orderItemRepo orderitemrepo.Repository,
	checkInRepo checkinrepo.Repository,
	checkInService *checkinservice.Service,
) *Service {
	return &Service{
		gateRepo:       gateRepo,
		gateStaffRepo:  gateStaffRepo,
		orderItemRepo:  orderItemRepo,
		checkInRepo:    checkInRepo,
		checkInService: checkInService,
	}
}

// ListMyGates returns gates assigned to a given staff member.
func (s *Service) ListMyGates(staffID string) ([]*gate.GateResponse, error) {
	gates, err := s.gateStaffRepo.ListGatesByStaffID(staffID)
	if err != nil {
		return nil, err
	}

	resp := make([]*gate.GateResponse, 0, len(gates))
	for _, g := range gates {
		if g == nil {
			continue
		}
		resp = append(resp, g.ToGateResponse())
	}
	return resp, nil
}

// ListStaffByGate lists all staff members assigned to a specific gate.
func (s *Service) ListStaffByGate(gateID string) ([]*user.UserResponse, error) {
	assignments, err := s.gateStaffRepo.ListStaffByGateID(gateID)
	if err != nil {
		return nil, err
	}

	resp := make([]*user.UserResponse, 0, len(assignments))
	for _, a := range assignments {
		if a != nil && a.Staff != nil {
			resp = append(resp, a.Staff.ToUserResponse())
		}
	}
	return resp, nil
}

// AssignStaffToGate assigns a staff member to a gate (admin only via routing).
func (s *Service) AssignStaffToGate(gateID, staffID string) error {
	// Validate gate exists
	if _, err := s.gateRepo.FindByID(gateID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGateNotFound
		}
		return err
	}
	return s.gateStaffRepo.Assign(gateID, staffID)
}

// UnassignStaffFromGate removes a staff member from a gate (admin only via routing).
func (s *Service) UnassignStaffFromGate(gateID, staffID string) error {
	// Validate gate exists
	if _, err := s.gateRepo.FindByID(gateID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGateNotFound
		}
		return err
	}
	return s.gateStaffRepo.Unassign(gateID, staffID)
}

// GetByID returns a gate by ID
func (s *Service) GetByID(id string) (*gate.GateResponse, error) {
	g, err := s.gateRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGateNotFound
		}
		return nil, err
	}
	return g.ToGateResponse(), nil
}

// Create creates a new gate
func (s *Service) Create(req *gate.CreateGateRequest) (*gate.GateResponse, error) {
	// Check if code already exists
	_, err := s.gateRepo.FindByCode(req.Code)
	if err == nil {
		return nil, ErrGateCodeExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = gate.GateStatusActive
	}

	// Create gate
	g := &gate.Gate{
		Code:        req.Code,
		Name:        req.Name,
		Location:    req.Location,
		Description: req.Description,
		IsVIP:       req.IsVIP,
		Status:      status,
		Capacity:    req.Capacity,
	}

	if err := s.gateRepo.Create(g); err != nil {
		return nil, err
	}

	// Reload to get generated fields
	createdGate, err := s.gateRepo.FindByID(g.ID)
	if err != nil {
		return nil, err
	}

	return createdGate.ToGateResponse(), nil
}

// Update updates a gate
func (s *Service) Update(id string, req *gate.UpdateGateRequest) (*gate.GateResponse, error) {
	// Find gate
	g, err := s.gateRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGateNotFound
		}
		return nil, err
	}

	// Update fields
	if req.Code != nil {
		// Check if new code already exists (if different from current)
		if *req.Code != g.Code {
			_, err := s.gateRepo.FindByCode(*req.Code)
			if err == nil {
				return nil, ErrGateCodeExists
			}
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, err
			}
		}
		g.Code = *req.Code
	}
	if req.Name != nil {
		g.Name = *req.Name
	}
	if req.Location != nil {
		g.Location = *req.Location
	}
	if req.Description != nil {
		g.Description = *req.Description
	}
	if req.IsVIP != nil {
		g.IsVIP = *req.IsVIP
	}
	if req.Status != nil {
		g.Status = *req.Status
	}
	if req.Capacity != nil {
		g.Capacity = *req.Capacity
	}

	if err := s.gateRepo.Update(g); err != nil {
		return nil, err
	}

	// Reload
	updatedGate, err := s.gateRepo.FindByID(g.ID)
	if err != nil {
		return nil, err
	}

	return updatedGate.ToGateResponse(), nil
}

// Delete deletes a gate
func (s *Service) Delete(id string) error {
	_, err := s.gateRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGateNotFound
		}
		return err
	}

	return s.gateRepo.Delete(id)
}

// List lists gates with pagination and filters
func (s *Service) List(req *gate.ListGatesRequest) ([]*gate.GateResponse, *response.PaginationMeta, error) {
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
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.IsVIP != nil {
		filters["is_vip"] = *req.IsVIP
	}
	if req.Search != "" {
		filters["search"] = req.Search
	}

	gates, total, err := s.gateRepo.List(page, perPage, filters)
	if err != nil {
		return nil, nil, err
	}

	responses := make([]*gate.GateResponse, len(gates))
	for i, g := range gates {
		responses[i] = g.ToGateResponse()
	}

	pagination := response.NewPaginationMeta(page, perPage, int(total))

	return responses, pagination, nil
}

// AssignTicketToGate assigns a ticket to a specific gate
func (s *Service) AssignTicketToGate(req *gate.AssignTicketToGateRequest) error {
	// Validate gate exists and is active
	g, err := s.gateRepo.FindByID(req.GateID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrGateNotFound
		}
		return err
	}

	if g.Status != gate.GateStatusActive {
		return ErrGateInactive
	}

	// Validate order item exists
	orderItem, err := s.orderItemRepo.FindByID(req.OrderItemID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("order item not found")
		}
		return err
	}

	// Check if ticket is VIP and gate is VIP (VIP priority entry system)
	if orderItem.Category != nil {
		// Check if category name contains "VIP" (simple check)
		categoryName := orderItem.Category.CategoryName
		isVIPCategory := containsVIP(categoryName)

		if isVIPCategory && !g.IsVIP {
			return ErrVIPGateRequired
		}
	}

	// Gate assignment is handled during check-in
	// This function is mainly for validation
	// The actual assignment happens in GateCheckIn

	return nil
}

// GateCheckIn performs check-in at a specific gate
func (s *Service) GateCheckIn(req *gate.GateCheckInRequest, staffID, ipAddress, userAgent string, isAdmin bool) (*checkin.CheckInResultResponse, error) {
	// Validate gate exists and is active
	g, err := s.gateRepo.FindByID(req.GateID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Gate tidak ditemukan",
				ErrorCode: "GATE_NOT_FOUND",
			}, ErrGateNotFound
		}
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Terjadi kesalahan saat validasi gate",
			ErrorCode: "GATE_VALIDATION_ERROR",
		}, err
	}

	if g.Status != gate.GateStatusActive {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "Gate tidak aktif",
			ErrorCode: "GATE_INACTIVE",
		}, ErrGateInactive
	}

	// Enforce staff-gate assignment for non-admin staff members
	if !isAdmin {
		assigned, err := s.gateStaffRepo.IsStaffAssignedToGate(req.GateID, staffID)
		if err != nil {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Terjadi kesalahan saat cek assignment gate",
				ErrorCode: "GATE_ASSIGNMENT_CHECK_ERROR",
			}, err
		}
		if !assigned {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Anda tidak ditugaskan untuk gate ini",
				ErrorCode: "GATE_STAFF_NOT_ASSIGNED",
			}, nil
		}
	}

	// Check gate capacity if set
	if g.Capacity > 0 {
		// Count check-ins for this gate today
		today := time.Now().Truncate(24 * time.Hour)
		todayEnd := today.Add(24 * time.Hour)

		checkIns, err := s.checkInRepo.FindByGateID(req.GateID)
		if err != nil {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Terjadi kesalahan saat cek kapasitas gate",
				ErrorCode: "CAPACITY_CHECK_ERROR",
			}, err
		}

		// Count check-ins today
		todayCount := int64(0)
		for _, ci := range checkIns {
			if ci.CheckedInAt.After(today) && ci.CheckedInAt.Before(todayEnd) {
				todayCount++
			}
		}

		if todayCount >= int64(g.Capacity) {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Kapasitas gate sudah penuh",
				ErrorCode: "GATE_CAPACITY_EXCEEDED",
			}, ErrGateCapacityExceeded
		}
	}

	// Find order item by QR code
	orderItem, err := s.orderItemRepo.FindByQRCode(req.QRCode)
	if err != nil {
		return &checkin.CheckInResultResponse{
			Success:   false,
			Message:   "QR code tidak valid",
			ErrorCode: "INVALID_QR_CODE",
		}, err
	}

	// Check VIP priority entry system
	if orderItem.Category != nil {
		categoryName := orderItem.Category.CategoryName
		isVIPCategory := containsVIP(categoryName)

		if isVIPCategory && !g.IsVIP {
			return &checkin.CheckInResultResponse{
				Success:   false,
				Message:   "Tiket VIP harus check-in di gate VIP",
				ErrorCode: "VIP_GATE_REQUIRED",
			}, ErrVIPGateRequired
		}
	}

	// Perform check-in using check-in service
	checkInReq := &checkin.CheckInRequest{
		QRCode:   req.QRCode,
		GateID:   &req.GateID,
		Location: req.Location,
	}

	return s.checkInService.CheckIn(checkInReq, staffID, ipAddress, userAgent)
}

// GetStatistics returns gate statistics
func (s *Service) GetStatistics(gateID string) (*gate.GateStatisticsResponse, error) {
	// Find gate
	g, err := s.gateRepo.FindByID(gateID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGateNotFound
		}
		return nil, err
	}

	// Get all check-ins for this gate
	checkIns, err := s.checkInRepo.FindByGateID(gateID)
	if err != nil {
		return nil, err
	}

	// Calculate statistics
	totalCheckIns := int64(len(checkIns))
	todayCheckIns := int64(0)
	vipCheckIns := int64(0)
	regularCheckIns := int64(0)

	today := time.Now().Truncate(24 * time.Hour)
	todayEnd := today.Add(24 * time.Hour)

	for _, ci := range checkIns {
		// Count today's check-ins
		if ci.CheckedInAt.After(today) && ci.CheckedInAt.Before(todayEnd) {
			todayCheckIns++
		}

		// Count VIP vs regular (based on gate VIP status or order item category)
		if ci.OrderItem != nil && ci.OrderItem.Category != nil {
			categoryName := ci.OrderItem.Category.CategoryName
			if containsVIP(categoryName) {
				vipCheckIns++
			} else {
				regularCheckIns++
			}
		} else {
			regularCheckIns++
		}
	}

	return &gate.GateStatisticsResponse{
		GateID:          g.ID,
		GateCode:        g.Code,
		GateName:        g.Name,
		TotalCheckIns:   totalCheckIns,
		TodayCheckIns:   todayCheckIns,
		VIPCheckIns:     vipCheckIns,
		RegularCheckIns: regularCheckIns,
	}, nil
}

// containsVIP checks if a string contains "VIP" (case-insensitive)
func containsVIP(s string) bool {
	return strings.Contains(strings.ToUpper(s), "VIP")
}
