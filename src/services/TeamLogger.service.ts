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

export class TeamLoggerService {
  static async getMyLogs(date?: string): Promise<TimeLog[]> {
    try {
      const queryParams = date ? `?date=${date}` : '';
      const response = await axios.get(`/api/teamlogger${queryParams}`);
      return response.data?.logs || [];
    } catch (error) {
      console.error('Failed to fetch team logs:', error);
      throw new Error('Failed to fetch team logs');
    }
  }

  static async checkIn(taskIds: string[]): Promise<TimeLog> {
    try {
      const response = await axios.post('/api/teamlogger/check-in', { taskIds });
      return response.data?.log;
    } catch (error) {
      console.error('Failed to check in:', error);
      throw new Error('Failed to check in');
    }
  }

  static async checkOut(logId: string): Promise<TimeLog> {
    try {
      const response = await axios.post(`/api/teamlogger/check-out/${logId}`);
      return response.data?.log;
    } catch (error) {
      console.error('Failed to check out:', error);
      throw new Error('Failed to check out');
    }
  }

  static async getActiveLog(): Promise<TimeLog | null> {
    try {
      const response = await axios.get('/api/teamlogger/active');
      return response.data?.log || null;
    } catch (error) {
      console.error('Failed to fetch active log:', error);
      throw new Error('Failed to fetch active log');
    }
  }
}
