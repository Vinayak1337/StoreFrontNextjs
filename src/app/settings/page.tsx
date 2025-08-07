import { getSettings } from '@/app/api/settings/actions';
import { SettingsClient } from '@/components/settings/settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
	const settings = await getSettings();

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<SettingsClient initialSettings={settings} />
		</div>
	);
}
