'use client';

import { Ban, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useStudents } from '../../../hooks/useStudents';

export default function StudentsPage() {
  const { students, loading, setActive } = useStudents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-textPrimary">Students</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Students self-register in the mobile app. Deactivate an account here if needed —
          accounts aren't created from this dashboard.
        </p>
      </div>

      <Card>
        {loading && <p className="text-sm text-textSecondary">Loading…</p>}
        {!loading && students.length === 0 && (
          <p className="text-sm text-textSecondary">No students have registered yet.</p>
        )}

        {students.map((student) => (
          <div
            key={student.uid}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium text-textPrimary">{student.fullName}</p>
              <p className="text-xs text-textSecondary">
                {student.matricNumber} · {student.email} · {student.phone}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={student.isActive ? 'success' : 'danger'}>
                {student.isActive ? 'Active' : 'Deactivated'}
              </Badge>
              <button
                onClick={() => setActive(student.uid, !student.isActive)}
                className="rounded-lg p-2 text-textSecondary hover:bg-surface hover:text-primary"
                aria-label={student.isActive ? `Deactivate ${student.fullName}` : `Reactivate ${student.fullName}`}
              >
                {student.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
