import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function Modal({ open, setOpen, title, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-96">
        <Dialog.Title className="text-lg font-bold text-center">{title}</Dialog.Title>
        {children}
        <Dialog.Close className="absolute top-3 right-3">
          <Cross2Icon />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
