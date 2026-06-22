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

  getMonthlyDeclaration(params: {
    date_from: string;
    date_to: string;
    department_id?: number;
    employee_id?: number;
  }) {
    const empConds = ['e.emp_active = 1'];
    const empArgs: any[] = [];
    if (params.department_id) { empConds.push('e.department_id = ?'); empArgs.push(params.department_id); }
    if (params.employee_id)   { empConds.push('e.id = ?');            empArgs.push(params.employee_id); }

    const employees = this.db.query<{
      id: number; emp_pin: string; emp_firstname: string; emp_lastname: string; dept_name: string;
    }>(
      `SELECT e.id, e.emp_pin, e.emp_firstname, e.emp_lastname, d.dept_name
       FROM hr_employee e
       LEFT JOIN hr_department d ON d.id = e.department_id
       WHERE ${empConds.join(' AND ')}
       ORDER BY d.dept_name, e.emp_firstname`,
      empArgs,
    );

    if (!employees.length) return [];

    const ids = employees.map(e => e.id);
    const ph  = ids.map(() => '?').join(',');

    const details = this.db.query<{
      employee_id: number; att_date: string;
      checkin: string | null; checkout: string | null;
      breakMinutes: number; workedMinutes: number;
      timetable_name: string; require_minutes: number;
    }>(
      `SELECT d.employee_id, date(d.att_date) as att_date,
              d.checkin, d.checkout,
              COALESCE(d.breakMinutes, 0)   as breakMinutes,
              COALESCE(d.workedMinutes, 0)  as workedMinutes,
              t.timetable_name,
              CASE
                WHEN t.timetable_end IS NOT NULL AND t.timetable_start IS NOT NULL THEN
                  (CAST(substr(t.timetable_end,   1, 2) AS INTEGER) * 60 + CAST(substr(t.timetable_end,   4, 2) AS INTEGER)) -
                  (CAST(substr(t.timetable_start, 1, 2) AS INTEGER) * 60 + CAST(substr(t.timetable_start, 4, 2) AS INTEGER))
                ELSE 420
              END as require_minutes
       FROM att_day_details d
       LEFT JOIN att_timetable t ON t.id = d.timetable_id
       WHERE d.employee_id IN (${ph}) AND date(d.att_date) BETWEEN ? AND ?
       ORDER BY d.employee_id, d.att_date`,
      [...ids, params.date_from, params.date_to],
    );

    const summaries = this.db.query<{
      employee_id: number; att_date: string; item_desc: string; item_results: number;
    }>(
      `SELECT s.employee_id, date(s.att_date) as att_date,
              LOWER(TRIM(COALESCE(si.item_desc, ''))) as item_desc,
              CAST(COALESCE(s.item_results, 0) AS REAL) as item_results
       FROM att_day_summary s
       LEFT JOIN att_StatisticItem si ON si.id = s.item_id
       WHERE s.employee_id IN (${ph}) AND date(s.att_date) BETWEEN ? AND ?`,
      [...ids, params.date_from, params.date_to],
    );

    // statsMap[empId][date][item_desc] = minutes
    const statsMap = new Map<number, Map<string, Record<string, number>>>();
    for (const s of summaries) {
      if (!statsMap.has(s.employee_id)) statsMap.set(s.employee_id, new Map());
      const byDate = statsMap.get(s.employee_id)!;
      if (!byDate.has(s.att_date)) byDate.set(s.att_date, {});
      const row = byDate.get(s.att_date)!;
      row[s.item_desc] = (row[s.item_desc] ?? 0) + s.item_results;
    }

    const pick = (empId: number, date: string, ...patterns: string[]): number => {
      const row = statsMap.get(empId)?.get(date);
      if (!row) return 0;
      for (const [k, v] of Object.entries(row)) {
        if (patterns.some(p => k.includes(p))) return v;
      }
      return 0;
    };

    const fmtMin = (min: number): string => {
      const abs = Math.abs(Math.round(min));
      return `${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
    };

    const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const toDow = (d: string) => DOW[new Date(d + 'T12:00:00').getDay()];

    const sumFmt = (rows: any[], field: string): string => {
      const total = rows.reduce((acc, r) => {
        const [h, m] = (r[field] as string).split(':').map(Number);
        return acc + h * 60 + m;
      }, 0);
      return fmtMin(total);
    };

    const byEmp = new Map<number, typeof details>();
    for (const d of details) {
      if (!byEmp.has(d.employee_id)) byEmp.set(d.employee_id, []);
      byEmp.get(d.employee_id)!.push(d);
    }

    return employees.map(emp => {
      const empDays = byEmp.get(emp.id) ?? [];
      const days = empDays.map(d => ({
        date:           d.att_date,
        dayOfWeek:      toDow(d.att_date),
        schedule:       d.timetable_name ?? '',
        checkIn:        d.checkin  ?? null,
        checkOut:       d.checkout ?? null,
        break:          fmtMin(d.breakMinutes),
        lateIn:         fmtMin(pick(emp.id, d.att_date, 'late in', 'latein', 'late')),
        earlyOut:       fmtMin(pick(emp.id, d.att_date, 'early out', 'earlyout', 'early')),
        absence:        fmtMin(pick(emp.id, d.att_date, 'absence', 'absent')),
        requireWork:    fmtMin(d.require_minutes > 0 ? d.require_minutes : 420),
        roundWork:      fmtMin(d.workedMinutes),
        ot1:            fmtMin(pick(emp.id, d.att_date, 'ot1', 'overtime1', 'overtime 1')),
        ot2:            fmtMin(pick(emp.id, d.att_date, 'ot2', 'overtime2', 'overtime 2')),
        ot3:            fmtMin(pick(emp.id, d.att_date, 'ot3', 'overtime3', 'overtime 3')),
        exceptionHours: fmtMin(pick(emp.id, d.att_date, 'exception')),
      }));

      return {
        id:         emp.id,
        pin:        emp.emp_pin,
        name:       `${emp.emp_firstname} ${emp.emp_lastname}`.trim(),
        department: emp.dept_name,
        days,
        totals: {
          daysWorked:     days.filter(d => d.checkIn !== null).length,
          break:          sumFmt(days, 'break'),
          lateIn:         sumFmt(days, 'lateIn'),
          earlyOut:       sumFmt(days, 'earlyOut'),
          absence:        sumFmt(days, 'absence'),
          requireWork:    sumFmt(days, 'requireWork'),
          roundWork:      sumFmt(days, 'roundWork'),
          ot1:            sumFmt(days, 'ot1'),
          ot2:            sumFmt(days, 'ot2'),
          ot3:            sumFmt(days, 'ot3'),
          exceptionHours: sumFmt(days, 'exceptionHours'),
        },
      };
    });
  }
}
