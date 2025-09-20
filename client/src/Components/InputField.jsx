export default function InputField({ label, type, name, value, onChange }) {
    return (
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-gray-400 focus:outline-none"
        />
      </div>
    );
  }
  