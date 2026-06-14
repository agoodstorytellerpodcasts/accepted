import { Routes, Route } from 'react-router-dom';
import CampaignsList from '../components/campaigns/CampaignsList';
import CampaignDetail from './CampaignDetail';

export default function Campaigns() {
  return (
    <Routes>
      <Route index element={<CampaignsList />} />
      <Route path=":id" element={<CampaignDetail />} />
    </Routes>
  );
}
