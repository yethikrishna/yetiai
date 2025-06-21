
import { AuthWrapper } from '@/components/AuthWrapper';
import { UsageAnalytics } from '@/components/UsageAnalytics';

const Analytics = () => {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <UsageAnalytics />
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Analytics;
