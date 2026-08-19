import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { registrationService } from '../../services/registrationService';

const STATUS_STYLE = {
  pending: { icon: Clock, className: 'text-amber-600 bg-amber-50' },
  pending_review: { icon: Clock, className: 'text-amber-600 bg-amber-50' },
  approved: { icon: CheckCircle2, className: 'text-green-700 bg-green-50' },
  rejected: { icon: XCircle, className: 'text-red-600 bg-red-50' },
};

export default function ApplicationStatus() {
  const { t } = useTranslation('forms');
  const location = useLocation();
  const [mobile, setMobile] = useState(location.state?.mobile || '');
  const [user, setUser] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (location.state?.mobile) {
      registrationService.getApplicationStatus(location.state.mobile).then((u) => {
        setUser(u);
        setSearched(true);
      });
    }
  }, [location.state]);

  async function handleCheck(e) {
    e.preventDefault();
    const u = await registrationService.getApplicationStatus(mobile);
    setUser(u);
    setSearched(true);
  }

  const style = user ? STATUS_STYLE[user.status] : null;
  const Icon = style?.icon;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-brand-800">{t('applicationStatus.title')}</h1>

      <form onSubmit={handleCheck} className="mt-6 flex gap-2">
        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile Number"
          inputMode="numeric"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-warm-white">
          Check
        </button>
      </form>

      {searched && !user && (
        <p className="mt-6 text-sm text-gray-500">No application found for this mobile number.</p>
      )}

      {user && (
        <div className={`mt-6 rounded-xl p-5 ${style.className}`}>
          <Icon size={28} />
          <p className="mt-3 text-sm">
            {(user.status === 'pending' || user.status === 'pending_review') && t('applicationStatus.pending')}
            {user.status === 'approved' && t('applicationStatus.approved', { memberId: user.memberId })}
            {user.status === 'rejected' && t('applicationStatus.rejected')}
          </p>
          {user.status === 'rejected' && user.rejectionReason && (
            <p className="mt-2 text-sm">
              <span className="font-medium">{t('applicationStatus.reason')}:</span> {user.rejectionReason}
            </p>
          )}
          {user.status === 'approved' && (
            <Link to="/login" className="mt-4 inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-warm-white">
              {t('applicationStatus.goToLogin')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
