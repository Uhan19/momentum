export default function Table({ title }: { title: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left font-bold">{title}</th>
            <th className="px-4 py-2 text-left font-bold"></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 border-t font-medium">T1</td>
            <td className="px-4 py-2 border-t"></td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-t font-medium">T2</td>
            <td className="px-4 py-2 border-t"></td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-t font-medium">T3</td>
            <td className="px-4 py-2 border-t"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
