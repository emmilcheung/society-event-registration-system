import { Grid } from "@material-ui/core";

const Loading = () => {
    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeContent: "center"
        }}>
            <img src="/img/giphy.gif" width="100%" height="100%"/>
        </div>
    );
}

export default Loading;