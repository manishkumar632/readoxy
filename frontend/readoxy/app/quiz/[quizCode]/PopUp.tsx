import React from "react";
import { Button } from "@/components/ui/button";

interface PopUpProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-lg font-bold mb-4">Are you sure you want to submit the test?</h2>
                <div className="flex justify-end space-x-4">
                    <Button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</Button>
                    <Button onClick={onConfirm} className="bg-green-500 text-white px-4 py-2 rounded">Submit</Button>
                </div>
            </div>
        </div>
    );
};

export default PopUp;
