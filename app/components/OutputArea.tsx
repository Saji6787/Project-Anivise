// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OutputArea({ text }: any) {
  if (!text) return null;

  return (
    <div className="mt-6 bg-zinc-900 border border-zinc-700 rounded-lg p-4 whitespace-pre-line">
      {text}
    </div>
  );
}
