import { StudentController } from '@/controllers/studentController';
import { sendSuccess, sendError } from '@/lib/response';

export async function GET(req: Request) {
  try {
    const result = await StudentController.getAllStudents(req);
    return sendSuccess('Students fetched successfully', result.data, result.meta);
  } catch (error: any) {
    return sendError(error.message || 'Failed to fetch students', error, 500);
  }
}

export async function POST(req: Request) {
  try {
    const result = await StudentController.createStudent(req);
    return sendSuccess('Student created successfully', result.data);
  } catch (error: any) {
    return sendError(error.message || 'Failed to create student', error, 400);
  }
}
