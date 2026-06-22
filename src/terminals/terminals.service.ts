import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TerminalsService {
  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.query(
      `SELECT id, terminal_no, terminal_name, terminal_location, terminal_status,
              terminal_type, terminal_tcpip, terminal_port, terminal_users,
              terminal_fingerprints, terminal_faces, terminal_punches,
              terminal_sns, terminal_firmversion, terminal_zem,
              PunchStamp, connection_model
       FROM att_terminal
       ORDER BY terminal_no`,
    );
  }

  findOne(id: number) {
    return this.db.queryOne(
      `SELECT * FROM att_terminal WHERE id = ?`,
      [id],
    );
  }

  getStats(id: number) {
    const terminal = this.db.queryOne<any>(
      `SELECT id, terminal_name, terminal_users, terminal_fingerprints,
              terminal_punches, PunchStamp FROM att_terminal WHERE id = ?`,
      [id],
    );

    const punchesToday = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches
       WHERE terminal_id = ? AND date(punch_time) = date('now')`,
      [id],
    );

    const punchesThisMonth = this.db.count(
      `SELECT COUNT(*) as cnt FROM att_punches
       WHERE terminal_id = ? AND strftime('%Y-%m', punch_time) = strftime('%Y-%m', 'now')`,
      [id],
    );

    return { ...terminal, punchesToday, punchesThisMonth };
  }
}
