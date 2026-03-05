export default function ResumeUpload() {
  return (
    <section className="p-5 flex flex-col justify-center items-center">
      <div className="w-2/5 flex flex-col gap-5 border border-dashed p-5 rounded-xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold">Upload Your Resume</h2>
          <p className="text-sm text-gray-500">Supported formats: PDF Only</p>
        </div>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-40 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer hover:bg-neutral-tertiary-medium rounded-xl"
          >
            <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm font-semibold">
                Drag & drop your resume here
              </p>
              <p className="text-xs">or click to browse</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" />
          </label>
        </div>

        <button className="btn btn-primary">Upload Resume</button>
      </div>
    </section>
  );
}
