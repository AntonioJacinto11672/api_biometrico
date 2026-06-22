import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly db: DatabaseService) {}

  getDaySummary(params: {
    employee_id?: number;
    date_from?: string;
    date_to?: string;
    department_id?: number;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.employee_id) {
      conditions.push('s.employee_id = ?');
      args.push(params.employee_id);
    }
    if (params.date_from) {
      conditions.push('s.att_date >= ?');
      args.push(params.date_from);
    }
    if (params.date_to) {
      conditions.push('s.att_date <= ?');
      args.push(params.date_to);
    }
    if (params.department_id) {
      conditions.push('e.department_id = ?');
      args.push(params.department_id);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const total = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_day_summary s
       LEFT JOIN hr_employee e ON e.id = s.employee_id ${where}`,
      args,
    );

    const data = this.db.query(
      `SELECT s.id, s.att_date, s.item_results, s.recordsFrom, s.recordsTo,
              s.remark, s.dt_id, s.item_id, s.timetable_id,
              e.emp_pin, e.emp_firstname, e.emp_lastname,
              d.dept_name,
              dt.dt_desc as day_type,
              si.item_desc as statistic_item
       FROM att_day_summary s
       LEFT JOIN hr_employee e ON e.id = s.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN att_DayType dt ON dt.id = s.dt_id
       LEFT JOIN att_StatisticItem si ON si.id = s.item_id
       ${where}
       ORDER BY s.att_date DESC, e.emp_firstname
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    );

    return { total, limit, offset, data };
  }

  getDayDetails(params: {
    employee_id?: number;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.employee_id) {
      conditions.push('d.employee_id = ?');
      args.push(params.employee_id);
    }
    if (params.date_from) {
      conditions.push('d.att_date >= ?');
      args.push(params.date_from);
    }
    if (params.date_to) {
      conditions.push('d.att_date <= ?');
      args.push(params.date_to);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const total = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_day_details d ${where}`,
      args,
    );

    const data = this.db.query(
      `SELECT d.id, d.att_date, d.checkin, d.checkout,
              d.roundin, d.roundout, d.workedMinutes, d.rworkedMinutes,
              d.breakMinutes, d.remark,
              e.emp_pin, e.emp_firstname, e.emp_lastname,
              dept.dept_name,
              t.timetable_name
       FROM att_day_details d
       LEFT JOIN hr_employee e ON e.id = d.employee_id
       LEFT JOIN hr_department dept ON dept.id = e.department_id
       LEFT JOIN att_timetable t ON t.id = d.timetable_id
       ${where}
       ORDER BY d.att_date DESC
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    );

    return { total, limit, offset, data };
  }

  getMonthlyReport(params: {
    year: number;
    month: number;
    department_id?: number;
  }) {
    const dateFrom = `${params.year}-${String(params.month).padStart(2, '0')}-01`;
    const dateEnd = new Date(params.year, params.month, 0);
    const dateTo = `${params.year}-${String(params.month).padStart(2, '0')}-${String(dateEnd.getDate()).padStart(2, '0')}`;

    const args: any[] = [dateFrom, dateTo];
    let deptFilter = '';
    if (params.department_id) {
      deptFilter = 'AND e.department_id = ?';
      args.push(params.department_id);
    }

    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, dept.dept_name,
              COUNT(DISTINCT d.att_date) as days_worked,
              SUM(d.workedMinutes) as total_minutes,
              ROUND(SUM(d.workedMinutes) / 60.0, 2) as total_hours,
              SUM(CASE WHEN d.checkin IS NOT NULL AND d.checkout IS NULL THEN 1 ELSE 0 END) as missing_checkout,
              SUM(CASE WHEN d.checkin IS NULL THEN 1 ELSE 0 END) as missing_checkin,
              MIN(d.checkin) as earliest_checkin,
              MAX(d.checkout) as latest_checkout
       FROM att_day_details d
       LEFT JOIN hr_employee e ON e.id = d.employee_id
       LEFT JOIN hr_department dept ON dept.id = e.department_id
       WHERE d.att_date BETWEEN ? AND ? ${deptFilter}
       GROUP BY e.id
       ORDER BY dept.dept_name, e.emp_firstname`,
      args,
    );
  }

  getDailyPresence(date: string) {
    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, dept.dept_name,
              d.checkin, d.checkout, d.workedMinutes,
              CASE WHEN d.id IS NULL THEN 'AUSENTE'
                   WHEN d.checkin IS NULL THEN 'SEM ENTRADA'
                   WHEN d.checkout IS NULL THEN 'SEM SAIDA'
                   ELSE 'PRESENTE'
              END as status
       FROM hr_employee e
       LEFT JOIN hr_department dept ON dept.id = e.department_id
       LEFT JOIN att_day_details d ON d.employee_id = e.id AND date(d.att_date) = ?
       WHERE e.emp_active = 1
       ORDER BY dept.dept_name, e.emp_firstname`,
      [date],
    );
  }
}
