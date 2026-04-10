type ResumePreviewProps = {
  file: File;
  handleFileRemove: () => void;
};

export default function ResumePreview(props: ResumePreviewProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
          PDF
        </div>
        <div>
          <p className="text-sm font-medium truncate">{props.file.name}</p>
          <p className="text-xs text-gray-400">
            {(props.file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={props.handleFileRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
