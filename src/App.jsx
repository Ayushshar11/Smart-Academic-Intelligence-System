import Layout from './components/Layout';
import PredictionCard from './components/PredictionCard';
import PerformanceChart from './components/PerformanceChart';
import AIInsights from './components/AIInsights';

function App() {
  return (
    <Layout>
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <PredictionCard type="Dropout Risk" score="12%" status="Low" />
        <PredictionCard type="Final Sem GPA (Predicted)" score="8.4" status="Success" />
        <PredictionCard type="Attendance Anomaly" score="Normal" status="Success" />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <AIInsights />
        </div>
      </div>
    </Layout>
  );
}
export default App;