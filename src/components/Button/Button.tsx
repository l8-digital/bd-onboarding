// components/Button/Button.tsx
'use client';

import React from 'react';
import NextLink from 'next/link';
import classNames from 'classnames';

type ButtonType = 'button' | 'submit' | 'a' | 'link';

interface ButtonProps {
    type?: ButtonType;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    color?:
        | 'primary' | 'secondary' | 'tertiary' | 'gray' | 'white'
        | 'outline-primary' | 'outline-light' | 'outline-black' | 'outline-red' | 'outline-custom' | 'outline-gray'
        | 'black' | 'black-light' | 'black-dark' | 'link-gray'
        | 'success' | 'blue' | 'warning' | 'danger' | 'pink' | 'outline-colorful' | 'link-blue'
        | 'link';
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    fullWidth?: boolean;
    iconOnly?: boolean;
    target?: '_blank' | '_self' | '_parent' | '_top';
    rel?: string;
    prefetch?: boolean; // Next.js Link prop (opcional)
}

const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5 leading-none',
    sm: 'text-sm px-4 py-2.5 leading-none',
    md: 'text-[15px] px-3 md:px-5 py-2.5',
    lg: 'text-lg px-7 py-2.5',
};

const colorClasses = {
    primary: 'bg-primary text-primary-bw hover:bg-primary/80',
    white: 'bg-white text-black hover:bg-white/80',
    secondary: 'bg-secondary hover:bg-secondary-dark text-tertiary',
    tertiary: 'bg-tertiary hover:bg-tertiary-dark text-white',
    gray: 'bg-[#f3f4f9] hover:bg-[#e5e6eb] text-[#272937]',
    'outline-primary': 'border border-primary text-primary hover:bg-primary hover:text-primary-bw',
    'outline-light': 'border border-black dark:border-white rounded-md text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black',
    'outline-red': 'border border-red rounded-md text-red hover:bg-red hover:text-white hover:bg-black/10 stroke-red hover:stroke-white',
    'outline-custom': 'border border-black rounded-md text-primary rounded-none hover:bg-white/40 hover:border-colorsecondary hover:text-black',
    black: 'border border-black bg-black text-white hover:bg-black-light ease-in',
    'link-gray': 'text-black/60 font-normal hover:underline ease-in',
    'outline-black': 'border border-black  text-black hover:bg-black/10',
    'outline-gray': 'border border-grayk text-gray hover:bg-gray/10',
    'black-light': 'bg-black text-white hover:bg-black-light ease-in bg-black-dark border border-white-dark dark:border-black-light ease-in',
    'black-dark': 'border border-black dark:border-white bg-black text-white hover:bg-black-light dark:bg-white dark:text-black dark:hover:bg-white-dark ease-in',
    success: 'bg-green text-white',
    blue: 'bg-blue hover:bg-blue-dark text-white',
    warning: 'bg-orange hover:bg-orange/90 text-white',
    danger: 'bg-red hover:bg-red-dark text-black',
    pink: 'bg-pink hover:bg-pink-dark text-white',
    'outline-colorful': 'colorful border text-black rounded-md',
    link: 'text-black !px-0 !py-0 hover:underline hover:opacity-60 shadow-transparent',
    'link-blue': 'text-blue !px-0 !py-0 shadow-transparent',
};

const loadingSpinnerClasses: Record<string, string> = {
    primary: 'border-white',
    white: 'border-black',
    secondary: 'border-white',
    tertiary: 'border-white',
    danger: 'border-red',
    success: 'border-green',
    warning: 'border-orange',
    blue: 'border-blue',
    'outline-primary': 'border-primary',
    'outline-red': 'border-red',
    'outline-black': 'border-black',
    'outline-gray': 'border-gray',
    'outline-light': 'border-black dark:border-white',
    black: 'border-white',
    'black-light': 'border-white',
    'black-dark': 'border-white',
    pink: 'border-white',
    link: 'border-black',
    'outline-custom': 'border-primary',
    'outline-colorful': 'border-black',
    'link-gray': 'border-black/40',
    'link-blue': 'border-blue',
};

const iconOnlySizeClasses = {
    xs: "w-6 h-6",   // 24px
    sm: "w-8 h-8",   // 32px
    md: "w-10 h-10", // 40px
    lg: "w-12 h-12", // 48px
};

export const Button: React.FC<ButtonProps> = ({
                                                  type = 'button',
                                                  size = 'md',
                                                  color = 'primary',
                                                  disabled = false,
                                                  loading = false,
                                                  href,
                                                  className = '',
                                                  onClick,
                                                  children,
                                                  iconLeft,
                                                  iconRight,
                                                  fullWidth = false,
                                                  target,
                                                  rel,
                                                  prefetch,
                                                  iconOnly
                                              }) => {
    const baseClass =
        'flex items-center justify-center whitespace-nowrap rounded-full font-medium text-center focus:outline-none transition font-secondary relative z-0';

    const isLoading = loading ? 'text-transparent cursor-not-allowed relative' : '';
    const isDisabled = disabled ? 'disabled:cursor-not-allowed opacity-50' : '';
    const widthClass = fullWidth ? 'w-full' : '';

    const spinnerClass = classNames(
        'absolute h-[18px] w-[18px] border-[2px] border-r-transparent rounded-full animate-spin',
        loadingSpinnerClasses[color] || 'border-black'
    );

    const spinner = loading && <span className={spinnerClass}/>;

    const composedClasses = classNames(
        baseClass,
        iconOnly
            ? iconOnlySizeClasses[size]
            : sizeClasses[size],
        colorClasses[color],
        isLoading,
        isDisabled,
        widthClass,
        className
    );

    const content = (
        <>
            {spinner}
            <span className={loading ? "invisible" : "flex items-center justify-center"}>
      {iconLeft && <span>{iconLeft}</span>}
                {!iconOnly && children}
                {iconRight && <span>{iconRight}</span>}
    </span>
        </>
    );

    // se for link, usamos NextLink para rotas internas e <a> para externas
    if ((type === 'a' || type === 'link') && href) {
        const isExternal = /^https?:\/\//i.test(href);
        const commonProps = {
            className: composedClasses,
            'aria-disabled': disabled || loading,
            onClick: (e: React.MouseEvent) => {
                if (disabled || loading) e.preventDefault();
                onClick?.(e);
            },
        };

        if (isExternal) {
            return (
                <a href={href} target={target}
                   rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)} {...commonProps}>
                    {content}
                </a>
            );
        }

        // Link interno
        return (
            <NextLink href={href} prefetch={prefetch} {...commonProps}>
                {content}
            </NextLink>
        );
    }

    // botão padrão
    return (
        <button
            type={type as 'button' | 'submit'}
            className={composedClasses}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {content}
        </button>
    );
};
