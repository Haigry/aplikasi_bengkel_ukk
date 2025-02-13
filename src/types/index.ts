export interface UserProfile {
  id: string;
  name: string;
  email: string;
  workshops: Workshop[];
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface DashboardData {
  user: UserProfile;
  upcomingWorkshops: Workshop[];
  pastWorkshops: Workshop[];
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  data: any;
  title: string;
}