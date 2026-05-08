import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department_id: z.string().optional(),
});

export class StudentController {
  /**
   * Get all students with pagination and filtering
   */
  static async getAllStudents(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('students')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, count, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Create a new student
   */
  static async createStudent(req: Request) {
    try {
      const body = await req.json();
      const validatedData = studentSchema.parse(body);

      const { data, error } = await supabase
        .from('students')
        .insert([validatedData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { data };
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new Error(err.errors.map((e) => e.message).join(', '));
      }
      throw err;
    }
  }

  /**
   * Delete a student
   */
  static async deleteStudent(id: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }
}
