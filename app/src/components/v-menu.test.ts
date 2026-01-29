import { mount } from '@vue/test-utils';
import { GlobalMountOptions } from '@vue/test-utils/dist/types';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { directive } from '@/directives/click-outside';
import TransitionBounce from './transition/bounce.vue';
import VMenu from './v-menu.vue';

beforeEach(() => {
	vi.useFakeTimers();

	// create teleport target
	const el = document.createElement('div');
	el.id = 'menu-outlet';
	document.body.appendChild(el);

	// mocking this as it seems like there's observer undefined error in happy-dom
	// but it is not crucial for the current test cases at the moment
	vi.spyOn(MutationObserver.prototype, 'disconnect').mockResolvedValue();
});

afterEach(() => {
	vi.useRealTimers();
});

const global: GlobalMountOptions = {
	directives: {
		'click-outside': directive as any,
	},
	components: {
		TransitionBounce,
	},
};

test('Mount component', () => {
	expect(VMenu).toBeTruthy();

	const wrapper = mount(VMenu, {
		slots: {
			default: 'Slot Content',
		},
		global,
	});

	expect(wrapper.html()).toMatchSnapshot();
});

test('should not open menu on click when trigger is not "click"', async () => {
	const wrapper = mount(VMenu, {
		global,
	});

	await wrapper.find('.v-menu-activator').trigger('click');
	expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('should open menu on click when trigger is "click"', async () => {
	const wrapper = mount(VMenu, {
		props: {
			trigger: 'click',
		},
		global,
	});

	await wrapper.find('.v-menu-activator').trigger('click');
	expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
});

test('should not close menu on content click when closeOnContentClick is false', async () => {
	const wrapper = mount(VMenu, {
		props: {
			modelValue: true, // make it open in the beginning to ensure '.v-menu-content' is in the dom
			closeOnContentClick: false,
		},
		global,
	});

	const content = wrapper.getComponent(TransitionBounce).find('.v-menu-content');
	await content.trigger('click');
	expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('should close menu on content click when closeOnContentClick is true', async () => {
	const wrapper = mount(VMenu, {
		props: {
			modelValue: true, // make it open in the beginning to ensure '.v-menu-content' is in the dom
			closeOnContentClick: true,
		},
		slots: {
			default: '<div class="menu-item">Option 1</div>',
		},
		global,
	});

	// Click on a child element (the component only closes if target !== currentTarget)
	const menuItem = wrapper.getComponent(TransitionBounce).find('.menu-item');
	await menuItem.trigger('click');
	expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
});

test('should not open menu on pointerenter when trigger is not "hover"', async () => {
	const wrapper = mount(VMenu, {
		props: {
			modelValue: false,
		},
		global,
	});

	await wrapper.find('.v-menu-activator').trigger('pointerenter');
	expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});

test('should open menu on pointerenter when trigger is "hover"', async () => {
	const wrapper = mount(VMenu, {
		props: {
			modelValue: false,
			trigger: 'hover',
		},
		global,
	});

	await wrapper.find('.v-menu-activator').trigger('pointerenter');
	// The component uses debounce, so we need to advance timers
	await vi.runAllTimersAsync();
	expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
});

test('should close menu on pointerleave when trigger is "hover"', async () => {
	const wrapper = mount(VMenu, {
		props: {
			trigger: 'hover',
		},
		global,
	});

	// First open the menu via hover
	await wrapper.find('.v-menu-activator').trigger('pointerenter');
	await vi.runAllTimersAsync();
	expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);

	// Then close it via pointerleave
	await wrapper.find('.v-menu-activator').trigger('pointerleave');
	await vi.runAllTimersAsync();
	expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false]);
});
