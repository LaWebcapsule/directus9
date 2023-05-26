import { useUserStore } from '@/stores/user';
import { Accountability } from '@wbce-d9/types';
import { parseFilter as parseFilterShared } from '@wbce-d9/utils';
import { Filter } from '@wbce-d9/types';

export function parseFilter(filter: Filter | null): Filter {
	const userStore = useUserStore();

	if (!userStore.currentUser) return filter ?? {};

	const accountability: Accountability = {
		role: userStore.currentUser.role.id,
		user: userStore.currentUser.id,
	};

	return parseFilterShared(filter, accountability) ?? {};
}
