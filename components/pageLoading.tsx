export default function PageLoading() {
    return(
        <div>
            <div className="hidden lg:block">
				<div className="p-4">
					Loading Screen
				</div>
			</div>
			<div className="w-full py-10 lg:hidden">
                Loading Screen
            </div>
        </div>//add loading page
    );
}