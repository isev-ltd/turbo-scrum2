import {Fragment} from 'react'
import {Menu, Transition} from '@headlessui/react'
import {ChevronDownIcon, EllipsisVerticalIcon} from '@heroicons/react/20/solid'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function DropdownMenu({children, renderButton, direction = "down"}) {
    return (
        <Menu as="div" className="relative inline-block text-left z-20">
            <div className="flex">
                {renderButton ? renderButton() : (
                    <Menu.Button
                        className="items-center w-full justify-center text-xs font-medium text-gray-700  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                        <EllipsisVerticalIcon className="w-5"/>
                    </Menu.Button>
                )}
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className={`${direction == 'down' ? 'absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none' : '-top-2 transform -translate-y-full absolute right-0 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'} z-10`}>
                    <div className="py-1">
                        {children}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
