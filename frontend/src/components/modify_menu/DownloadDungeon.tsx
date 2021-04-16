import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import JSZip from 'jszip';
import { DungeonMap } from '../../models/DungeonMap';

type Props = {
	open: boolean;
	map: DungeonMap | null;
	getSingleImage: () => Map<string, any>;
	getMultipleImages: () => Map<string, any>;
  	onDownload: (valid: boolean, response: string) => void;
 	onCancel: () => void;
}

export default function DownloadDungeon(props: Props) {  
	// REQ-5: Download.DungeonImage - The system shall allow a user to download the image of a generated dungeon
	const handleSingleDownload = async () => {
		if (props.map){
			var namesToFiles = props.getSingleImage();
			var json = props.map.getContentJSON();
			namesToFiles.set('DungeonMap.json', new Blob([json], {type: 'application/json'}))
			await zipAndDownload(namesToFiles);
		}
		else{
			props.onDownload(false, "No Dungeon Available");
		}
	}

	// REQ-6: Download.DungeonLayerImages - The system shall allow a user to download the image of each layer of a generated dungeon.
	const handleLayerDownloads = async () => {
		if (props.map){
			var namesToFiles = props.getMultipleImages();
			var json = props.map.getContentJSON();
			namesToFiles.set('DungeonMap.json', new Blob([json], {type: 'application/json'}))
			await zipAndDownload(namesToFiles);
		}
		else{
			props.onDownload(false, "No Dungeon Available");
		}
	}

	// REQ-7: Download.DungeonJson - The system shall allow a user to download the json representation of a generated dungeon.
	const handleJsonDownload = async () => {
		if (props.map){
			var json = props.map.getJSON();
			await createObjectAndDownload(new Blob([json], {type: 'application/json'}), 'DungeonMap.json');
			props.onDownload(true, "Downloaded Dungeon");
		}
		else{
			props.onDownload(false, "No Dungeon Available");
		}
	}

	const zipAndDownload = async (namesToFiles: Map<string, any>) => {
		var zip = new JSZip();

		namesToFiles.forEach((url, fileName) => {
			if (fileName.endsWith(".json")){
				zip.file(fileName, url);
			}
			else{
				zip.file(fileName, url.substr(url.indexOf(',')+1), {base64: true});
			}
		});
		var content = await zip.generateAsync({type:"blob"})
		
		await createObjectAndDownload(content, "DungeonMap.zip")

		props.onDownload(true, "Downloaded Dungeon");
	}

	const createObjectAndDownload = async (blob: any, fileName: string) => {
		var url = await URL.createObjectURL(blob);
		var link = document.createElement('a');
		link.download = fileName;
		link.href = url;
		link.click();
	}

	return (
		<div>
		<Dialog open={props.open} aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">Download Dungeon</DialogTitle>
			<DialogContent>
				<Button onClick={handleSingleDownload} color="primary">
					Single Image
				</Button>
				<Button onClick={handleLayerDownloads} color="primary">
					Layer Images
				</Button>
				<Button onClick={handleJsonDownload} color="primary">
					JSON
				</Button>
			</DialogContent>
			<DialogActions>
			<Button onClick={props.onCancel} color="primary">
				Cancel
			</Button>
			</DialogActions>
		</Dialog>
		</div>
	);
}