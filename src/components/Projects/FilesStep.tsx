import { Button } from "../ui/button";

export default function FilesStep({ onNext }: { onNext: (data: unknown) => void }) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Files</h2>
            <p className="text-gray-600">
                Upload files related to the project. Supported formats include
                PDF, PNG, and DOCX.
            </p>
            <Button className="mt-4">Upload Files</Button>
        </div>
    )
}
