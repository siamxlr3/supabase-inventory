import { supabase } from '@/lib/supabase';

export class DepartmentController {
  static async getAllDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code')
      .order('name');

    if (error) throw error;
    return { data };
  }
}
