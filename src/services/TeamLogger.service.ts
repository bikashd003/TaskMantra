import axios from 'axios';

// MongoDB ObjectId type
interface ObjectId {
  $oid: string;
}

// MongoDB Date type
interface MongoDate {
  $date: string;
}

export interface TimeLog {
  id?: string;
  _id?: string | ObjectId;
  userId?: string | ObjectId;
  checkIn: string | Date | MongoDate;
  checkOut?: string | Date | MongoDate | null;
  taskId?: string;
  task?: Array<string | ObjectId | any>;
  date: string | Date | MongoDate;
  __v?: number;
}

export interface CheckOutResponse {
  log: TimeLog;
  timeSpent: number;
  message: string;
}

export class TeamLoggerService {
  static async getMyLogs(date?: string): Promise<TimeLog[]> {
    try {
      const queryParams = date ? `?date=${date}` : '';
      const response = await axios.get(`/api/teamlogger${queryParams}`);
      return response.data?.logs || [];
    } catch (error) {
      throw new Error('Failed to fetch team logs');
    }
  }

  static async checkIn(taskIds: string[]): Promise<TimeLog> {
    try {
      const response = await axios.post('/api/teamlogger/check-in', { taskIds });
      return response.data?.log;
    } catch (error) {
      throw new Error('Failed to check in');
    }
  }

  static async checkOut(logId: string): Promise<CheckOutResponse> {
    try {
      const response = await axios.post(`/api/teamlogger/check-out/${logId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to check out');
    }
  }

  static async getActiveLog(): Promise<TimeLog | null> {
    try {
      const response = await axios.get('/api/teamlogger/active');
      return response.data?.log || null;
    } catch (error) {
      throw new Error('Failed to fetch active log');
    }
  }
}
