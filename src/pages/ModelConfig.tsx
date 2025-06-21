
import { AuthWrapper } from '@/components/AuthWrapper';
import { ModelConfigPanel } from '@/components/ModelConfigPanel';

const ModelConfig = () => {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <ModelConfigPanel />
        </div>
      </div>
    </AuthWrapper>
  );
};

export default ModelConfig;
