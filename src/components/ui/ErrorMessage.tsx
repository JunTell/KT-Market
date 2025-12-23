import Image from "next/image";

export const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center gap-2 text-redNotice">
      <Image
        src="/images/notice_red.svg"
        alt="notice_red"
        width={12}
        height={12}
        className='mb-2xs size-3'
      />
      <span className="text-body2">{message}</span>
    </div>
  );
};