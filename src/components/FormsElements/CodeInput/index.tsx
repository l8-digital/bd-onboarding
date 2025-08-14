import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef
} from "react";

interface CodeInputProps {
    length?: number;
    onComplete?: (code: string) => void;
}

export interface CodeInputRef {
    clear: () => void;
}

const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(({ length = 6, onComplete }, ref) => {
    const [code, setCode] = useState<string[]>(Array(length).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
        clear: () => {
            setCode(Array(length).fill(""));
            inputsRef.current[0]?.focus();
        }
    }));

    const focusInput = (index: number) => {
        inputsRef.current[index]?.focus();
    };

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const updated = [...code];
        updated[index] = value;
        setCode(updated);

        if (value && index < length - 1) {
            focusInput(index + 1);
        }

        if (updated.every((val) => val !== "")) {
            onComplete?.(updated.join(""));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            const updated = [...code];
            if (code[index]) {
                updated[index] = "";
                setCode(updated);
            } else if (index > 0) {
                updated[index - 1] = "";
                setCode(updated);
                focusInput(index - 1);
            }
        }

        if (e.key === "ArrowLeft" && index > 0) {
            focusInput(index - 1);
        }

        if (e.key === "ArrowRight" && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").replace(/\D/g, ""); // Apenas números
        if (!paste) return;

        const chars = paste.slice(0, length).split("");
        const newCode = Array(length).fill("");

        for (let i = 0; i < chars.length; i++) {
            newCode[i] = chars[i];
        }

        setCode(newCode);

        // Foca o próximo após o último colado, se houver
        const nextIndex = Math.min(chars.length, length - 1);
        focusInput(nextIndex);

        if (newCode.every((val) => val !== "")) {
            onComplete?.(newCode.join(""));
        }
    };


    return (
        <div className="w-full flex justify-between gap-1">
            {code.map((char, i) => (
                <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="tel"
                    placeholder="-"
                    autoComplete="off"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={(e) => handlePaste(e)}
                    className="w-11 h-12 text-center text-black font-bold text-xl bg-neutral/5 rounded"
                />
            ))}
        </div>
    );
});

export default CodeInput;
