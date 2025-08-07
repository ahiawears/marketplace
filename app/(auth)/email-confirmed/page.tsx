import { Logo } from "@/components/ui/logo"

const EmailConfirmed = () => {
    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='container mx-auto w-full p-5 px-10 py-10 lg:w-2/4 lg:block md:w-10/12'>
                <div className="text-center py-5 mb-5">
                    <Logo />
                </div>
                <h1 className='text-center pb-10 font-bold block'>Your Email has been confirmed</h1>
                <p className='text-center'>You can close this tab</p>
            </div>
        </div>
    )
}

export default EmailConfirmed