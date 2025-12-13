import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "../services/attendanceService";
import type { AttendeeFilters } from "../types";

export function useAttendees(filters?: AttendeeFilters) {
  return useQuery({
    queryKey: ["attendees", filters],
    queryFn: () => attendanceService.getAttendees(filters),
    staleTime: 30000, // 30 seconds
  });
}
