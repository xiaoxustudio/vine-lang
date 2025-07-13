class ErrorMangaer extends Error {
	constructor(public message: string) {
		super(message);
		this.name = "ErrorMangaer";
	}
}
