import React from 'react';
import {
    Input,
    Select,
    HStack,
    Text,
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { formatAmount } from '@/lib/currency';

interface CurrencyInputProps {
    value: number;
    currency: string;
    onValueChange: (value: number) => void;
    onCurrencyChange: (currency: string) => void;
    placeholder?: string;
    disabled?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
}

export function CurrencyInput({
    value,
    currency,
    onValueChange,
    onCurrencyChange,
    placeholder = 'Enter amount',
    disabled = false,
    isInvalid = false,
    errorMessage,
}: CurrencyInputProps) {
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        if (!isNaN(newValue)) {
            onValueChange(newValue);
        }
    };

    return (
        <FormControl isInvalid={isInvalid}>
            <HStack spacing={2}>
                <Input
                    type="number"
                    value={value}
                    onChange={handleValueChange}
                    placeholder={placeholder}
                    isDisabled={disabled}
                    min={0}
                    step={0.01}
                />
                <Select
                    value={currency}
                    onChange={(e) => onCurrencyChange(e.target.value)}
                    isDisabled={disabled}
                    width="180px"
                >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="CNY">CNY - Chinese Yuan (¥)</option>
                    <option value="JPY">JPY - Japanese Yen (¥)</option>
                    <option value="KRW">KRW - South Korean Won (₩)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="RUB">RUB - Russian Ruble (₽)</option>
                    <option value="BRL">BRL - Brazilian Real (R$)</option>
                    <option value="CAD">CAD - Canadian Dollar (C$)</option>
                    <option value="AUD">AUD - Australian Dollar (A$)</option>
                    <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    <option value="HKD">HKD - Hong Kong Dollar (HK$)</option>
                    <option value="TWD">TWD - Taiwan Dollar (NT$)</option>
                    <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                    <option value="THB">THB - Thai Baht (฿)</option>
                    <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
                    <option value="PHP">PHP - Philippine Peso (₱)</option>
                    <option value="VND">VND - Vietnamese Dong (₫)</option>
                </Select>
                <Text color="gray.500" fontSize="sm">
                    {formatAmount(value, currency)}
                </Text>
            </HStack>
            <FormErrorMessage>{errorMessage}</FormErrorMessage>
        </FormControl>
    );
} 