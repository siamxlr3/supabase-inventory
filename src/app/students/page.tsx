'use client';

import { useGetStudentsQuery, useCreateStudentMutation } from '@/store/api/studentApi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function StudentsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { data: response, isLoading, isError, refetch } = useGetStudentsQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent({ name, email }).unwrap();
      toast.success('Student created successfully');
      setName('');
      setEmail('');
    } catch (err: any) {
      // RTK Query baseApi handles toast error automatically if we want, 
      // but here we can handle specific local logic.
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Versity Students</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isCreating ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Student List</h2>
          <button 
            onClick={() => refetch()} 
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading students...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 italic">Failed to load students</div>
        ) : response?.data?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students found in the database.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {response?.data?.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{student.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
