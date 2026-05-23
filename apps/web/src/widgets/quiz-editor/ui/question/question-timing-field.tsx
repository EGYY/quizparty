export function QuestionTimingField({
  label,
  maxLength,
  min,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  maxLength?: number;
  min?: number;
  placeholder: string;
  type?: 'number' | 'text';
  value: number | string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        maxLength={maxLength}
        min={min}
        placeholder={placeholder}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
