import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PunchesService {
  constructor(private readonly db: DatabaseService) {}

  findAll(params: {
    employee_id?: number;
    date_from?: string;
    date_to?: string;
    terminal_id?: number;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.employee_id) {
      conditions.push('p.employee_id = ?');
      args.push(params.employee_id);
    }
    if (params.date_from) {
      conditions.push('p.punch_time >= ?');
      args.push(params.date_from);
    }
    if (params.date_to) {
      conditions.push('p.punch_time <= ?');
      args.push(params.date_to + ' 23:59:59');
    }
    if (params.terminal_id) {
      conditions.push('p.terminal_id = ?');
      args.push(params.terminal_id);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const total = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches p ${where}`,
      args,
    );

    const data = this.db.query(
      `SELECT p.id, p.punch_time, p.workcode, p.workstate, p.verifycode,
              p.punch_type, p.status, p.annotation,
              p.employee_id, e.emp_pin, e.emp_firstname, e.emp_lastname,
              p.terminal_id, t.terminal_name, t.terminal_tcpip
       FROM att_punches p
       LEFT JOIN hr_employee e ON e.id = p.employee_id
       LEFT JOIN att_terminal t ON t.id = p.terminal_id
       ${where}
       ORDER BY p.punch_time DESC
       LIMIT ? OFFSET ?`,
      [...args, limit, offset],
    );

    return { total, limit, offset, data };
  }

  findByEmployee(employeeId: number, dateFrom?: string, dateTo?: string) {
    const args: any[] = [employeeId];
    let dateFilter = '';

    if (dateFrom) {
      dateFilter += ' AND p.punch_time >= ?';
      args.push(dateFrom);
    }
    if (dateTo) {
      dateFilter += ' AND p.punch_time <= ?';
      args.push(dateTo + ' 23:59:59');
    }

    return this.db.query(
      `SELECT p.id, p.punch_time, p.workcode, p.workstate,
              p.verifycode, p.punch_type, p.status,
              t.terminal_name
       FROM att_punches p
       LEFT JOIN att_terminal t ON t.id = p.terminal_id
       WHERE p.employee_id = ? ${dateFilter}
       ORDER BY p.punch_time DESC`,
      args,
    );
  }

  findByDate(date: string) {
    return this.db.query(
      `SELECT p.id, p.punch_time, p.workstate, p.verifycode,
              e.emp_pin, e.emp_firstname, e.emp_lastname,
              d.dept_name, t.terminal_name
       FROM att_punches p
       LEFT JOIN hr_employee e ON e.id = p.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       LEFT JOIN att_terminal t ON t.id = p.terminal_id
       WHERE date(p.punch_time) = ?
       ORDER BY p.punch_time`,
      [date],
    );
  }

  summary(params: { date_from: string; date_to: string; department_id?: number }) {
    const args: any[] = [params.date_from, params.date_to + ' 23:59:59'];
    let deptFilter = '';

    if (params.department_id) {
      deptFilter = 'AND e.department_id = ?';
      args.push(params.department_id);
    }

    return this.db.query(
      `SELECT e.emp_pin, e.emp_firstname, e.emp_lastname, d.dept_name,
              COUNT(p.id) as total_punches,
              MIN(p.punch_time) as first_punch,
              MAX(p.punch_time) as last_punch,
              COUNT(DISTINCT date(p.punch_time)) as days_present
       FROM att_punches p
       LEFT JOIN hr_employee e ON e.id = p.employee_id
       LEFT JOIN hr_department d ON d.id = e.department_id
       WHERE p.punch_time BETWEEN ? AND ? ${deptFilter}
       GROUP BY e.id
       ORDER BY e.emp_firstname`,
      args,
    );
  }
}
