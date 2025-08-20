'use client';

import React from 'react';
import {usePathname, useParams} from 'next/navigation';
import Image from 'next/image';
import styles from './style.module.scss';

const StepNav: React.FC = () => {
    const pathname = usePathname();
    const {id} = useParams();

    const steps = [
        {path: `/${id}/organization`, label: 'Organização'},
        {path: `/${id}/partners`, label: 'Sócios'},
        {path: `/${id}/collaborators`, label: 'Colaboradores'},
        {path: `/${id}/documents`, label: 'Documentos'},
    ];

    const currentIndex = Math.max(
        0,
        steps.findIndex((s) => pathname?.startsWith(s.path))
    );

    return (
        <header className="md:fixed top-0 left-0 bg-white w-full pt-8 md:pt-5 pb-3 z-[20]">
            <div className="md:px-8 flex flex-col items-center md:flex-row md:items-end gap-6 md:gap-0">
                <div className="w-full md:w-3/12">
                    <div className="w-32 mx-auto md:mx-0">
                        <Image src="/bd-logo.svg" alt="BD Logo" width={128} height={40} priority/>
                    </div>
                </div>

                <div className="w-full md:w-6/12">
                    <ul className={styles['nav-steps']}>
                        {steps.map((step, index) => (
                            <li key={step.path} className="flex flex-col items-center flex-1 z-[0]">
                                <div
                                    className={`p-1 flex items-center text-neutral justify-center rounded-full z-1 ${
                                        index <= currentIndex ? 'bg-primary' : 'bg-transparent'
                                    }`}
                                />
                                <span
                                    className={`mt-2 text-xs sm:text-sm ${
                                        index === currentIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'
                                    }`}
                                >
                  {step.label}
                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-full md:w-3/12"/>
            </div>
        </header>
    );
};

export default StepNav;
