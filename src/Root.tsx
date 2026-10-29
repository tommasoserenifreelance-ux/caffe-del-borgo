import { Composition, Folder } from "remotion";
import { CAFFE_DEL_BORGO_DURATION, CaffeDelBorgo } from "./CaffeDelBorgo";
import { CANNOLI_DURATION, Cannoli } from "./Cannoli";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="CaffeDelBorgo">
      <Composition
        // npx remotion render CaffeDelBorgo out/caffe-del-borgo.mp4
        id="CaffeDelBorgo"
        component={CaffeDelBorgo}
        durationInFrames={CAFFE_DEL_BORGO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // npx remotion render Cannoli out/cannoli.mp4
        id="Cannoli"
        component={Cannoli}
        durationInFrames={CANNOLI_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};
