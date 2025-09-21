export default function InputField({ label, type, name, value, onChange, placeholder, error, disabled, icon }) {
  return (
    <div className="space-y-2">
      <label className="block text-slate-700 text-sm font-semibold mb-3 flex items-center">
        {icon && <span className="mr-2 text-blue-600">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/80' 
              : disabled
              ? 'border-slate-200 bg-slate-50/80 text-slate-400 cursor-not-allowed'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          {error}
        </p>
      )}
    </div>
  );
}