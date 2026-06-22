import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ShiftsService {
  constructor(private readonly db: DatabaseService) {}

  findAllShifts() {
    return this.db.query(
      `SELECT s.*, COUNT(sd.id) as total_days
       FROM att_shift s
       LEFT JOIN att_shift_details sd ON sd.shift_id = s.id
       GROUP BY s.id
       ORDER BY s.shift_name`,
    );
  }

  findShiftDetails(shiftId: number) {
    return this.db.query(
      `SELECT sd.*, t.timetable_name
       FROM att_shift_details sd
       LEFT JOIN att_timetable t ON t.id = sd.timetable_id
       WHERE sd.shift_id = ?
       ORDER BY sd.shift_date`,
      [shiftId],
    );
  }

  findAllTimetables() {
    return this.db.query(
      `SELECT id, timetable_name, timetableType, timetable_color,
              timetable_start, timetable_end,
              timetable_checkin_begin, timetable_checkout_end,
              timetable_late, timetable_latecome,
              timetable_early, timetable_earlyout,
              enableOT, firstInLastOut, isDefault
       FROM att_timetable
       ORDER BY timetable_name`,
    );
  }

  getEmployeeShifts(employeeId: number) {
    return this.db.query(
      `SELECT es.startDate, es.endDate, es.NoEndDate, s.shift_name
       FROM att_employee_shift es
       LEFT JOIN att_shift s ON s.id = es.shift_id
       WHERE es.employee_id = ?
       ORDER BY es.startDate DESC`,
      [employeeId],
    );
  }
}
