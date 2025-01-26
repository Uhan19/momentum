import { ProfileForm } from '@/app/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Profile Settings</h1>
      <ProfileForm />
    </div>
  );
}
