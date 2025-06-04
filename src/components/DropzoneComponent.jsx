import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 0,
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  opacity: 0.5,
  borderStyle: "dashed",
  backgroundColor: "#000000",
  color: "#bdbdbd",
  transition: ".3s ease-in-out",
  width: "48px",
  height: "48px",
  position: "relative",
  overflow: "hidden",
  fontSize: "12px",
  fontWeight: "bold",
  cursor: "pointer",
  margin: "10px"
};

const activeStyle = {
  opacity: 1,
  transition: ".3s ease-in-out",
};

const acceptStyle = {
  opacity: 1,
  transition: ".3s ease-in-out",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

function DropzoneComponent(props) {
  const { displayText, promoteTexture, promoteMask } = props;

  const [file, setFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        if (file && file.preview) {
          URL.revokeObjectURL(file.preview);
        }

        setFile(
          Object.assign(acceptedFiles[0], {
            preview: URL.createObjectURL(acceptedFiles[0]),
          })
        );
      }
    },
    [file]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
    maxFiles: 1,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  // Clean up
  useEffect(() => {
    
    if (file) {
      if (displayText === "图片") {
        promoteTexture(file);
      } else {
        promoteMask(file);
      }
    }

    return () => {
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);
  

  return (
    <section>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        {file ? (
          <img
            src={file.preview}
            alt={file.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: baseStyle.borderRadius,
            }}
          />
        ) : (
          <div>{isDragActive ? <p>添加</p> : <p>{displayText}</p>}</div>
        )}
      </div>
    </section>
  );
}

export default DropzoneComponent;
