import React from "react";
import { connect } from 'react-redux'
import { Tree, TreeNode } from "react-organizational-chart";
import './chatOrganigram.scss'

export const organigramChart = (props) => {
  const { baseData: { departments, majors, positions }} = props
  const renderNoteTree = (arrayNodes) => {
    let result = [];
    arrayNodes.map((d, index) => {
      result.push(
        <TreeNode
          key={d.id}
          label={
            <a>
              <img src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" />
              <span>
                {departments.find((i) => i.id == d.department_id)?.name}- 
                {positions.find((i) => i.id == d.position_id)?.name}-
                {majors.find((i) => i.id == d.major_id)?.name}
              </span>
            </a>
          }
        >
          {d.children.length > 0 ? renderNoteTree(d.children) : []}
        </TreeNode>
      );
    });
    return result;
  };
 
  return (
    <div className="tree">
      <Tree
        label={
          <a>
            <img src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" />
            <div>BOD</div>
          </a>
        }
      >
        {renderNoteTree(props.datas)}
      </Tree>
    </div>
  );
}

const mapStateToProps = (state) => ({
  baseData: state.baseData,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(organigramChart)
