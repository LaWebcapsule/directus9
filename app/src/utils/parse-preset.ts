import { useUserStore } from '@/stores/user';
import { Accountability, Role, User } from '@db-studio/types';
import { parsePreset as parsePresetShared } from '@db-studio/utils';

export function parsePreset(preset: Record<string, any> | null): Record<string, any> {
	const { currentUser } = useUserStore();

	if (!currentUser) return preset ?? {};

	const accountability: Accountability = {
		role: currentUser.role.id,
		user: currentUser.id,
	};

	return (
		parsePresetShared(preset, accountability, {
			$CURRENT_ROLE: currentUser.role as Role,
			$CURRENT_USER: currentUser as User,
		}) ?? {}
	);
}
