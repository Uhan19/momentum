import { ProfileForm } from '@/app/components/profile/profile-form';
import { AuthenticatedLayout } from '@/app/components/layout/authenticated-layout';

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        <ProfileForm />
      </div>
    </AuthenticatedLayout>
  );
}
