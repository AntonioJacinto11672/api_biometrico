import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  getDashboard() {
    const totalEmployees = this.db.count(
      `SELECT COUNT(*) as cnt FROM hr_employee WHERE emp_active = 1`,
    );
    const totalDepartments = this.db.count(
      `SELECT COUNT(*) as cnt FROM hr_department`,
    );
    const totalPunches = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches`,
    );
    const punchesToday = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches WHERE date(punch_time) = date('now')`,
    );
    const punchesThisMonth = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches
       WHERE strftime('%Y-%m', punch_time) = strftime('%Y-%m', 'now')`,
    );

    const presentToday = this.db.count(
      `SELECT COUNT(DISTINCT employee_id) as cnt FROM att_punches
       WHERE date(punch_time) = date('now')`,
    );

    const terminal = this.db.queryOne<any>(
      `SELECT terminal_name, terminal_status, terminal_tcpip, PunchStamp FROM att_terminal LIMIT 1`,
    );

    const recentPunches = this.db.query(
      `SELECT p.punch_time, e.emp_firstname, e.emp_lastname, d.dept_name, t.terminal_name
       FROM att_punches p
       LEFT JOIN hr_employee e ON e.id = p.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN att_terminal t ON t.id = p.terminal_id
       ORDER BY p.punch_time DESC LIMIT 10`,
    );

    return {
      employees: { total: totalEmployees, presentToday },
      departments: totalDepartments,
      punches: { total: totalPunches, today: punchesToday, thisMonth: punchesThisMonth },
      terminal,
      recentPunches,
    };
  }

  getAbsentReport(date: string, department_id?: number) {
    const args: any[] = [date];
    let deptFilter = '';
    if (department_id) {
      deptFilter = 'AND e.department_id = ?';
      args.push(department_id);
    }

    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, d.dept_name, p.posi_name
       FROM hr_employee e
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN hr_position p ON p.id = e.position_id
       WHERE e.emp_active = 1 ${deptFilter}
         AND e.id NOT IN (
           SELECT DISTINCT employee_id FROM att_punches
           WHERE date(punch_time) = ?
         )
       ORDER BY d.dept_name, e.emp_firstname`,
      [date, ...args],
    );
  }

  getLateArrivals(date: string, department_id?: number) {
    const args: any[] = [date];
    let deptFilter = '';
    if (department_id) {
      deptFilter = 'AND e.department_id = ?';
      args.push(department_id);
    }

    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, d.dept_name,
              dd.checkin, dd.roundin, dd.workedMinutes,
              t.timetable_name, t.timetable_start
       FROM att_day_details dd
       LEFT JOIN hr_employee e ON e.id = dd.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN att_timetable t ON t.id = dd.timetable_id
       WHERE date(dd.att_date) = ? ${deptFilter}
         AND dd.checkin > t.timetable_checkin_end
       ORDER BY dd.checkin`,
      [date, ...args],
    );
  }

  getTopPresence(params: { date_from: string; date_to: string; limit?: number }) {
    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, d.dept_name,
              COUNT(DISTINCT date(p.punch_time)) as days_present,
              COUNT(p.id) as total_punches
       FROM att_punches p
       LEFT JOIN hr_employee e ON e.id = p.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       WHERE p.punch_time BETWEEN ? AND ?
       GROUP BY e.id
       ORDER BY days_present DESC
       LIMIT ?`,
      [params.date_from, params.date_to + ' 23:59:59', params.limit ?? 20],
    );
  }
}
