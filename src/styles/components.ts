export const styleConfig = {
  card: "bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300",
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-all duration-300",
    danger: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300",
  },
  input: "block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-300",
  select: "block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-300",
  modal: {
    overlay: "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50",
    content: "bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto",
  },
  table: {
    wrapper: "overflow-hidden rounded-lg border border-gray-200 shadow-md",
    header: "bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
  }
};
