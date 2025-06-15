import React from 'react';
import { Select } from '@chakra-ui/react';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface CurrencySelectProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function CurrencySelect({ value, onChange, className }: CurrencySelectProps) {
    return (
        <Select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
            {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                </option>
            ))}
        </Select>
    );
}